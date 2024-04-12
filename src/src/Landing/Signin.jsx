import React, { useState } from "react";
import styles from './landing.module.css'
import { Navigate, Link, useNavigate } from "react-router-dom";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doCreateUserWithEmailAndPassword, sendPasswordResetEmail } from "../../../firebase/auth"; 
import { useAuth, getUser } from "../Context/authContext";


export function Signin() {
    const { userLoggedIn, currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userVerified, setUserVerified] = useState(false);


    const sendInfo = async () => {
        const user = await getUser();
        const token = user.token;
        if (currentUser) {
            const config= {
                headers: {'Authorization': 'Bearer ' + token},
            }
            await axios.post('https://aivispitchstackserver.azurewebsites.net/auth', config)
        }
    }

    const doValidateUser = async () => {
        const user = await getUser();
        if (user.emailVerified) {
            setUserVerified(true);
        } else {
            console.log("User email not verified");
        }
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            await doSignInWithEmailAndPassword(email, password); 
            await doValidateUser();
            await sendInfo();
        }
    }

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false);
            });
            await doValidateUser();
            await sendInfo();
        }
    }

    return (
        <div>
            {userLoggedIn && userVerified && (<Navigate to={'/dropbox'} replace={true} />)}
            <main className={styles.main}>
                <div className={styles.inputContainer}>
                    <h3 className={styles.headerThing}>Sign in to your account</h3>
                        <div className={styles.googleBtnContainer}>
                            <button
                            onClick={onGoogleSignIn}
                            className={styles.googleBtn}><img src='/google.svg' alt='google logo' className={styles.googleSvg}></img>Sign in with google<img src='/right.svg' alt='arrow right' className={styles.rarrowSvg}></img></button>
                        </div>

                        <div className={styles.divider}>
                            <div className={styles.line}></div>
                            <span>or</span>
                            <div className={styles.line}></div>
                        </div>

                        <form className={styles.inputForm} onSubmit={onSubmit}>
                            <label htmlFor="email">Email</label>
                            <input
                                className={styles.inputs}
                                type="text"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                name="email"
                                placeholder="email@gmail.com"
                            />
                            <label htmlFor="password">Password</label>
                            <input
                                className={styles.inputs}
                                type="password"
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                                name="password"
                                placeholder="Password"
                            />
                            <div className={styles.loginBtnContainer}>
                                <button 
                                type="submit"
                                className={styles.inputFormBtn}
                                >Sign In</button>
                            </div>
                        </form>
                        <span onClick={handlePasswordReset}>Forgot Password</span>
                </div>
            </main>
        </div>
    )
}