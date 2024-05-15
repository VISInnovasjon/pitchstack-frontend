import styles from './stats.module.css';
import { Aside } from './components/Aside';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../Context/Context';
import { useAuth } from '../Context/authContext/index'
import jsPDF from 'jspdf';

export function Stats() {
    const { selectedPDFData, hasSubmitted, selectedFileNames, uploadType } = useContext(AppContext);
    const [ activeDiv, setActiveDiv ] = useState(null);
    const { currentUser } = useAuth()

    function generatePDFWithText(pdfData) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const maxLineWidth = pageWidth - margin * 2;

        const headerHeight = 28;
        doc.setFillColor(0);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        const addText = (text, yPosition, fontSize = 12, isBold = false) => {
            doc.setFontSize(fontSize);
            doc.setFont(undefined, isBold ? 'bold' : 'normal');
            text = text.replace(/≥/g, ">=");
            text = text.replace(/≤/g, "<=");
            let lines = doc.splitTextToSize(text, maxLineWidth);
            lines.forEach(line => {
                if (yPosition > pageHeight - 10) {
                    doc.addPage();
                    yPosition = 10
                }
                doc.text(line, 5, yPosition)
                yPosition += 5;
            });
            return yPosition;
        }

        const imgData = "/jpgbanner2.jpg";
        doc.addImage(imgData, 'JPG', 5, 0, 60, 28);
        doc.setTextColor(241, 241, 241);
        doc.setFontSize(12);
        doc.textWithLink("https://www.visinnovasjon.no/", 150, 25, { url: "https://www.visinnovasjon.no/" });
        doc.setTextColor(24, 24, 24);


        doc.setFontSize(14);
        let pitchScoreLabel = "Your pitchscore";
        let pitchScoreWidth = doc.getTextWidth(pitchScoreLabel);
        let xPosition = 5;
        let yPosition = 40;

        doc.text(pitchScoreLabel, xPosition, yPosition);

        xPosition += pitchScoreWidth + 5;
        doc.setFontSize(24);
        const weightedScore = calculateWeightedScore(pdfData.data, ratings)
        doc.text(`${weightedScore}`, xPosition, yPosition);

        Object.entries(pdfData.data).forEach(([key, value]) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 10;
            } else {
                yPosition +=5
            }

            yPosition = addText(`${key}`, yPosition + 6, 14, true);
            yPosition = addText(`Item: ${value.item}`, yPosition);
            yPosition = addText(`Evaluation: ${value.evaluation}`, yPosition);
            yPosition = addText(`Rating: ${value.rating}`, yPosition);
        });

        doc.save(`${selectedFileNames[0].originalFileName}-pitchstack.pdf`)
    }

    const clickDiv = (key) => {
        if (activeDiv === null) {
            setActiveDiv(key); 
        } else {
            setActiveDiv(null);
        }
    }


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
        console.log("selectedPDFData[0]:", selectedPDFData[0]);
        if (selectedPDFData[0]?.data) {
            console.log(".data", selectedPDFData[0]?.data)
            console.log("typeof:", typeof selectedPDFData[0]?.data)
        }
    }, [selectedPDFData])

    return (
        <div className={styles.container}>
            <Aside />
            {selectedPDFData && selectedPDFData[0]?.data && (
                <div className={styles.stats}>
                    {selectedPDFData && selectedPDFData[0]?.data && selectedPDFData.map((pdfData, index) => {
                        const weightedScore = calculateWeightedScore(pdfData.data, ratings);
                        return (
                        <div key={index} className={styles.pdfcontainer}>
                            <div className={styles.pdfstats}>
                            <div className={styles.score}><h2>Your pitchscore </h2><div className={styles.scoreNum}>{weightedScore}</div></div>
                            <div className={styles.infographic}><p>The pitchstack replicates a VC fundmember that is an industry expert. In a similar way to how one expert might give a different score than another when reviewing a pitchstack the pitchstack AI will also vary in its scoring.  When weighted against previous pitchstacks that have done well and ones that have done poorly, there is a good correlation between scoring highly and the subsequent success of the startup.  A score between 0-35 is considered poor, 35-50 good and over 50 is excellent.</p></div>
                            <div className={styles.pdfBtnContainer}><button className={styles.pdfBtn} onClick={() => generatePDFWithText(pdfData) }><div className={styles.iconContainer}><img src='/pdfdl.svg'></img></div>Download as PDF</button></div>
                            {pdfData && pdfData.data && typeof pdfData.data === 'object' && Object.entries(pdfData.data).map(([key, value]) => (
                                <div key={key} className={styles.itemCard} onClick={() => clickDiv(key)} style={activeDiv === key ? {zindex: 10, transform: 'scale(1.5)', background: '#020202',  height: 'fit-content'} : {}}>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
  }
