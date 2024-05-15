import axios from 'axios';
import styles from './res.module.css'
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/Context';
import { fetchNewData } from '../Context/Context';
import { jsonrepair } from 'jsonrepair';




export function Res() {
    const [response, setResponse] = useState([]);
    const [ activeDiv, setActiveDiv ] = useState(null);
    const [error, setError] = useState(null);
    const { fileHash, retryAttempt, setRetryAttempt, uploadType } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        if (fileHash) {
                try {
                    const responseString = await fetchNewData(fileHash, uploadType)
                    const responseObject = JSON.parse(responseString);
                    setResponse(responseObject);
                    setRetryAttempt(false);
                    console.log("response:",response);
                } catch (error) {
                    console.error("Error parsing response:", error);
                    setError("Failed to fetch data");
                }
            }
        }
    fetchData();
        }, [fileHash, retryAttempt, setRetryAttempt, navigate]);

    function getColor(rating) {
        switch (rating) {
            case "green" : 
                return "/Green_pitchstack.svg";
            case "yellow": 
                return "/yellow_pitchstack.svg";
            case "red": 
                return "/red_pitchstack.svg";
            default:
                return "grey";
        }
    }

    const clickDiv = (key) => {
        if (activeDiv === null) {
            setActiveDiv(key); 
        } else {
            setActiveDiv(null);
        }
    }

    function calculateWeightScore(data) {
        switch (data) {
            case "green":
                return 2.5;
            case "yellow":
                return 1;
            case "red":
                return 0;
            default:
                return 0;       
        }
    }

    const ratings = [10, 9, 8, 20, 14, 5, 5, 5, 0.5, 0.5, 1, 0.5, 8, 0.5, 0.5, 5, 3, 1, 0.5, 1, 1, 1];

    function calculateWeightedScore(responseData, ratings) {
        let totalScore = 0;
        let maxScore = 0;
        if (uploadType === "form") {
            Object.entries(responseData).forEach(([key, value], index) => {
                const ratingValue = calculateWeightScore(value.rating);
                if (index < ratings.length) {
                    totalScore += ratingValue;
                }
            });
            const scoreValue = Math.floor((totalScore / 12.5) * 100);
            return scoreValue;

        } else {

            Object.entries(responseData).forEach(([key, value], index) => {
                const ratingValue = calculateWeightScore(value.rating);
                if (index < ratings.length) {
                    const weight = ratings[index] ?? 0;
                    totalScore += ratingValue * weight;
                    maxScore += 2.5 * weight;
                }
            });
            const scoreValue = Math.floor((totalScore / maxScore) * 100);
            return scoreValue;
        }
        
    };

    useEffect(() => {
        if (response) {
            console.log("response:", response);
            console.log(typeof response.evaluation);
        }
    })
    const weightedScore = calculateWeightedScore(response, ratings)
    
    return (
        <div className={styles.container}>
            <div className={styles.stats}>
            <div className={styles.pdfcontainer}>
                <div className={styles.pdfstats}>
                <div className={styles.score}><h2>Your pitchscore </h2><div className={styles.scoreNum}>{weightedScore}</div></div>
                <div className={styles.infographic}><p>The pitchstack replicates a VC fundmember that is an industry expert. In a similar way to how one expert might give a different score than another when reviewing a pitchstack the pitchstack AI will also vary in its scoring.  When weighted against previous pitchstacks that have done well and ones that have done poorly, there is a good correlation between scoring highly and the subsequent success of the startup.  A score between 0-35 is considered poor, 35-50 good and over 50 is excellent.</p></div>

                        {response && Object.entries(response).map(([key, value]) => (
                            <div key={key} className={styles.itemCard} onClick={() => clickDiv(key)} style={activeDiv === key ? {zindex: 10, transform: 'scale(1.5)', background: '#020202', height: 'fit-content'} : {}}>
                            <div className={styles.cardText}>
                            <div className={styles.cardTextHeaderContainer}>
                                <div className={styles.colorBox} >
                                    <img src={ getColor(value.rating) } alt='crab color rating image'></img>
                                </div>
                                <div className={styles.textcontainer}>
                                    <h3>{key}:</h3>
                                </div>
                            </div>
                            <p>{value.item}</p>
                            <p>{value.evaluation}</p>
                            </div>
                            
                        </div>
                        ))}

                   </div>
                </div>
            </div>
        </div>
    )
  }




  
