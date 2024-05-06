import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './dropbox.module.css'
import axios from 'axios';
import { AppContext } from '../Context/Context';
import { getUser, useAuth } from '../Context/authContext/index';
import { jokesArray } from './jokesarray'



export function Dropbox() {
  const [isUploadComplete, setUploadComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const  {fileHash, setFileHash, setRetryAttempt, setUploadType, uploadType}  = useContext(AppContext);
  const { currentUser } = useAuth();
  const messages = jokesArray;

  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(Math.floor(Math.random() * messages.length));
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [key, setKey] = useState(0);

  const navigate = useNavigate()

  const drop = React.useRef(null);
  const fileInput = React.useRef(null);

  const handleRadioButtonChange = (event) => {
    setUploadType(event.target.value);
  }

  useEffect(() => {
    console.log("Upload Type changed to:", uploadType);
  }, [uploadType]);

  useEffect(() => {
    if (isLoading) {
      console.log("interval set");
      const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setMessageIndex(randomIndex);
      }, 10000);
      console.log("Interval cleared");
      return () => clearInterval(intervalId);
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setCurrentMessage(messages[messageIndex]);
    }
  }, [messageIndex, messages, isLoading]);

  useEffect(() => {
    if (isLoading && currentMessage) {
      setDisplayedMessage('');
      let displayText = '';
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < currentMessage.length) {
        displayText += currentMessage[charIndex];
        setDisplayedMessage(displayText);
        charIndex++
      } else {
        clearInterval(typingInterval);
      }
      if (charIndex >= currentMessage.length) {
        clearInterval(typingInterval);
      }
      }, 50);
      return () => clearInterval(typingInterval);
  }
  }, [currentMessage, isLoading]);

  const onUpload = useCallback(async (files) => {
    setUploadError('');
    setIsLoading(true);
    setUploadComplete(false);
    setFileHash(null);
    
    if (files[0] && files[0].type !== 'application/pdf') {
      setUploadError('Crabs only like valid PDF files.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', files[0]);

    const user = await getUser();
    const token = user.token;

    const config = {
      headers: {'Authorization': 'Bearer ' + token},
    };
    
    try {
      const url = uploadType === "pitch" ? "https://vispitchstackserver.azurewebsites.net/uploads" : "https://vispitchstackserver.azurewebsites.net/applications";
      const response = await axios.post(url, formData, config);
      console.log("Upload successful", response.data);
      setFileHash(response.data.metadata.fileHash);
      navigate('/res');
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An error occurred during file upload.')
    } finally {
      setIsLoading(false);
    }
  }, [uploadType, navigate])


  useEffect(() => {
    if (isUploadComplete && fileHash) {
      navigate('/res');
    }
  }, [isUploadComplete, fileHash, navigate]);


  useEffect(() => {
    const dropElement = drop.current;

    const removeEventListeners = () => {
      const dropElement = drop.current;
      if (dropElement) {
        dropElement.removeEventListener('dragover', handleDragOver);
        dropElement.removeEventListener('drop', handleDrop)
      }
    }

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };


    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
    
      const {files} = e.dataTransfer;
    
      if (files && files.length) {
        setUploadError('');
        setIsLoading(true);
        await onUpload(files);
        setIsLoading(false);
        removeEventListeners()
        setUploadComplete(true);
        setRetryAttempt(false);
      }
      
    };

    if (dropElement) {
        drop.current.addEventListener('dragover', handleDragOver);
        drop.current.addEventListener('drop', handleDrop);
    }

    return removeEventListeners
  }, [uploadType]);
  
  const handleFileSelect = (e) => {
    const { files } = e.target;
    
    if (files && files.length) {
      onUpload(files);
      setIsLoading(false);
      setUploadComplete(true);
      setRetryAttempt(false);
    }
  };

  const handleClick = () => {
    fileInput.current.click();
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
    if (currentUser) {
      const doGlobalDBUpdate = async () => {
        const user = await getUser();
        const token = user.token;
        const config= {
            headers: {'Authorization': 'Bearer ' + token},
        }
        try {
          await axios.post('https://vispitchstackserver.azurewebsites.net/auth', config)
        } catch (error) {
          console.log("Error authorizing user from GlobalDB", error);
          try {
            await axios.post('https://vispitchstackserver.azurewebsites.net/register', config)
          } catch (error) {
            console.log("Error updating GlobalDB", error);
          }
        }
      }

      doGlobalDBUpdate();
    }
  }, [currentUser]);

  return (
    
    <div className={styles.dropbox} >

      <div className={styles.dbradioContainer}>
        <ul>
          <input type="radio" id='pitch' onChange={handleRadioButtonChange} checked={uploadType === "pitch"} value="pitch"></input>
          <label htmlFor='pitch'>Pitch pdf</label>
          <input type="radio" id='form' onChange={handleRadioButtonChange} checked={uploadType === "form"} value="form"></input>
          <label htmlFor='form'>Application pdf</label>
        </ul>
      </div>

      {uploadError && (
        <div className={styles.errorMessage}>
          <h1>{uploadError}</h1>
        </div>
      )}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <img src='/loading.svg' className={styles.placeholderImg}></img>
          <p>Loading. Please wait.</p>
          {displayedMessage}
        </div>
      )}

      {uploadType === "pitch" && (
        <div key={key} ref={drop} id='dropbox' className={`${styles.dragNdrop} ${isLoading ? styles.hidden : ''}`} onClick={handleClick}>
        <div id='dropboxlabel'>Drop pitchstack here
        <span
          role='img'
          aria-label='emoji'
          className='area__icon'
        >
          &#129408;
        </span>
        </div>
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileSelect}
          aria-labelledby='dropboxlabel'
          style={{ display: "none" }}
          accept=".pdf"
          />
      </div>
      )}
        {uploadType === "form" && (
        <div key={key} ref={drop} id='dropbox' className={`${styles.dragNdrop} ${isLoading ? styles.hidden : ''}`} onClick={handleClick}>
        <div id='dropboxlabel'>Drop application here
        <span
          role='img'
          aria-label='emoji'
          className='area__icon'
        >
          &#129408;
        </span>
        </div>
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileSelect}
          aria-labelledby='dropboxlabel'
          style={{ display: "none" }}
          accept=".pdf"
          />
      </div>
      )}
    </div> 
    )
  };
