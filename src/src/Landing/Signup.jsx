import React, { useState, useEffect } from "react";
import styles from './landing.module.css'
import axios from 'axios';
import { Navigate, Link, useNavigate } from "react-router-dom";
import { doSignInWithGoogle, doCreateUserWithEmailAndPassword, doSendEmailVerification, doPasswordReset } from "../../../firebase/auth"; 
import { useAuth, getUser } from "../Context/authContext";

export function Signup() {
    const { userLoggedIn, currentUser, setCurrentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userVerified, setUserVerified] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [submittedForgotMail, setSubmittedForgotMail] = useState(false);

    const sendInfo = async () => {
        const user = await getUser();
        const token = user.token;
        if (currentUser) {
            const config= {
                headers: {'Authorization': 'Bearer ' + token},
            }
            await axios.post('https://aivispitchstackserver.azurewebsites.net/register', config)
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

    const handlePasswordReset = (event) => {
        event.preventDefault();
        const mail = event.target.email.value;
        doPasswordReset(mail);
        setSubmittedForgotMail(prevState => !prevState);
    };

    const toggleForgotPassword = () => {
        setForgotPassword(prevState => !prevState);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                const userCredential = await doCreateUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                await doSendEmailVerification();
                setCurrentUser(user);
                await doValidateUser();
                try {
                    await sendInfo();
                } catch (error) {
                    console.error("Registration to global db failed:", error);
                }
            } catch (error) {
                console.error("Registration or verification failed:", error);
            }
            setIsRegistering(false);
        }  
    }

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false);
            })
            try {
                await sendInfo();
            } catch (error) {
                console.error("Registration to global db failed:", error);
            }
        }
    }

    useEffect(() => {
        if (currentUser) {
            doValidateUser();
            sendInfo();
        }
    }, [currentUser]);

    return (
        <div>
            {userLoggedIn && userVerified && (<Navigate to={'/dropbox'} replace={true} />)}
            <main className={styles.main}>
                <div className={styles.inputContainer}>
                    {!forgotPassword && (
                        <>
                         <h3 className={styles.headerThing}>Create your account</h3>
                            <div className={styles.inputWrapper}>
                                <div className={styles.googleBtnContainer}>
                                    <button
                                    onClick={onGoogleSignIn}
                                    className={styles.googleBtn}><img src='/google.svg' alt='google logo' className={styles.googleSvg}></img>Sign up with google<img src='/right.svg' alt='right arrow' className={styles.rarrowSvg}></img></button>
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
                                        name="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="email@gmail.com"
                                    />
                                    <label htmlFor="password"></label>
                                    <input
                                        className={styles.inputs}
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="Password"
                                    />
                                    <div className={styles.loginBtnContainer}>
                                        <button 
                                        type="submit"
                                        className={styles.inputFormBtn}
                                        >Sign Up</button>
                                    </div>
                                </form>
                                <span className={styles.accountSpan} onClick={toggleForgotPassword}>Forgot Password</span>
                            </div>
                        </>
                        )}  
                    {forgotPassword && !submittedForgotMail && (
                        <>
                        <h3 className={styles.headerThing}>Submit to reset password</h3>
                        <div className={styles.inputWrapper}>
                            <form className={styles.inputForm} onSubmit={handlePasswordReset}>
                                <label htmlFor="email">Email</label>
                                <input
                                    className={styles.inputs}
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="email@gmail.com"
                                    required
                                />
                                <label htmlFor="password"></label>
                                <div className={styles.loginBtnContainer}>
                                        <button 
                                        type="submit"
                                        className={styles.inputFormBtn}
                                        >Reset Password</button>
                                    </div>
                            </form>
                            <span className={styles.accountSpan} onClick={toggleForgotPassword}>Back</span>
                        </div>
                        </>
                    )}

                    {forgotPassword && submittedForgotMail && (
                        <h3 className={styles.gradientText}>Email sent with Password reset!</h3>
                    )}
                </div>
            </main>
        </div>
    )
}
