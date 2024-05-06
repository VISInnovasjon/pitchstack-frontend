import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios';
import { jsonrepair } from 'jsonrepair';
import { getUser } from "../Context/authContext";

export const AppContext = createContext()

export const context = () => {
    return useContext(AppContext);
};

export const ContextProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState('');
    const [selectedPDFData, setSelectedPDFData] = useState([]);
    const [fileHash, setFileHash] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [canLogin, setCanLogin] = useState(false);
    const [canLogout, setCanLogout] = useState(false);
    const [selectedFileNames, setSelectedFileNames] = useState([]);
    const [checkedState, setCheckedState] = useState({});
    const [retryAttempt, setRetryAttempt] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [uploadType, setUploadType] = useState("pitch");

    useEffect( () => {
        const initializeState = async () => {
            const loginStateStr = localStorage.getItem('loginState');
            const loginState = loginStateStr ? JSON.parse(loginStateStr) : null;
            if (loginState?.hasSubmitted && loginState !== null) {
                const storedUsername = loginState.username;
                await refreshToken();
                setIsLogin(false);
                setCanLogin(false);
                setHasSubmitted(true);
                setUsername(storedUsername);
            }  
        };
        initializeState();
    }, []);

    const value = {
        accessToken,
        setAccessToken,
        selectedPDFData,
        setSelectedPDFData,
        fileHash,
        setFileHash,
        hasSubmitted,
        setHasSubmitted,
        canLogin,
        setCanLogin,
        canLogout,
        setCanLogout,
        selectedFileNames,
        setSelectedFileNames,
        checkedState, 
        setCheckedState,
        retryAttempt,
        setRetryAttempt,
        isLogin,
        setIsLogin,
        username,
        setUsername,
        password,
        setPassword,
        uploadType,
        setUploadType

    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function setLogout() {
    localStorage.removeItem("loginState");
};



export async function fetchNewData(fileHash, uploadType) {
        const user = await getUser();
        const token = user.token;
        
        const config= {
            headers: {'Authorization': 'Bearer ' + token},     
            }
        
        if (uploadType === "form") {
            try {
                const response = await axios.get(`https://vispitchstackserver.azurewebsites.net/applications/${fileHash}`, config);
                
    
                if (response) {
                    let responseObj;
                    try {
                        responseObj = JSON.parse(response.data.pitchresponse.response);
                    } catch (error) {
                        console.error("Error parsing the response:", error);
                    }
                    let evaluationString;
                    let firstMessageContent = responseObj.body.data[0];
                    evaluationString = firstMessageContent.content[0].text.value;
                    const fixedString = evaluationString.replace(/^```(plaintext|json|javascript)?\s*(plaintext|json|javascript)?\s*\n?|\n?\s*```$/gm, '').trim()
                    const repairedString = jsonrepair(fixedString)
    
                        return repairedString
                    }
                    
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }

        } else if (uploadType === "pitch") {

            try {
                const response = await axios.get(`https://vispitchstackserver.azurewebsites.net/uploads/${fileHash}`, config);
                
    
                if (response) {
                    let responseObj;
                    try {
                        responseObj = JSON.parse(response.data.pitchresponse.response);
                    } catch (error) {
                        console.error("Error parsing the response:", error);
                    }
                    let evaluationString;
                    let firstMessageContent = responseObj.body.data[0];
                    evaluationString = firstMessageContent.content[0].text.value;
                    const fixedString = evaluationString.replace(/^```(plaintext|json|javascript)?\s*(plaintext|json|javascript)?\s*\n?|\n?\s*```$/gm, '').trim()
                    const repairedString = jsonrepair(fixedString)
    
                        return repairedString
                    }
                    
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }

        } else {
            console.error('Error, please specify upload type', error);
            setUploadError('An error occurred during data fetching.');
        }
    };

export async function deleteResponse(fileHash) {
        const user = await getUser();
        const token = user.token;
        
        const config= {
            headers: {'Authorization': 'Bearer ' + token},     
            }
        axios.delete(`https://vispitchstackserver.azurewebsites.net/uploads/${fileHash}`, config)
            .then(response => console.log("Deleted response successfully", response))
            .catch(error => Promise.reject(error));
    };
