import './App.css';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import NewQuestion from './components/New Question/NewQuestion';
import EditQuestion from './components/EditQuestion/EditQuestion';
import Output from './components/Output/Output';
import SelectList from './components/Selection/SelectList';
import QuestionsList from './components/Questions/QuestionsList';
import Header from './components/UI/Header';
import jwtDecode from 'jwt-decode';
import { useEffect, useState } from 'react';
import { deleteAccessToken, deleteRefreshToken, setAccessToken, setRefreshToken } from './services/tokenService';
import AppApi from './services/appApi';
import Login from './components/Login/Login';
import ChangePassword from './components/ChangePassword/ChangePassword';
import Loading from './components/UI/Loading';
const baseURL = process.env.REACT_APP_BASE_URL;

function App() {
    const [questionsList, updateQuestionsList] = useState([]);
    const [editModeQ, updateEditmodeQ] = useState(null);
    const [editMode, updateEditMode] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const navigate = useNavigate();
    
    const autoPingServer = () => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            AppApi.get(baseURL + '/user')
                .then(response => {
                    if (response.status === 200 && jwtDecode(token).username === response.data.name) {
                        setIsLoggedIn(true);
                        setTokenExpiry(jwtDecode(sessionStorage.getItem('accessToken')).exp * 1000);
                    } else {
                        if (isLoggedIn) setIsLoggedIn(false);
                    }
                })
                .finally(() => {
                    setUserLoading(false);
                });
        } else {
            if (isLoggedIn) setIsLoggedIn(false);
            setUserLoading(false);
        }
    };

    useEffect(() => {
        const questions = JSON.parse(localStorage.getItem('questions'));
        questions && updateQuestionsList(questions);
        autoPingServer();
        if (isLoggedIn && !userLoading) {
            const bufferTime = 1 * 30 * 1000;
            const timeUntilExpiry = tokenExpiry - Date.now() + bufferTime;
            const autoPingTimeout = setTimeout(autoPingServer, timeUntilExpiry);
            return () => clearTimeout(autoPingTimeout);
        }
    }, [isLoggedIn, userLoading, tokenExpiry]);


    const handleLogin = (accessToken, refreshToken) => {
        if (accessToken && refreshToken) {
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setIsLoggedIn(true);
        }
    };

    const addQuestionHandler = question => {
        if (question?.id) {
            updateQuestionsList(state => {
                let hasDataCodes = false;
                let arr;
                state.forEach((question) => {
                    if(question.questionType === 'datacodes')
                        hasDataCodes=true;
                })
                if(hasDataCodes && question.questionType==='datacodes'){
                    return state;
                } else if (!hasDataCodes && question.questionType==='datacodes') {
                    state.splice(0,0,question);
                    arr=[...state];
                } else if (question.questionType!='datacodes') {
                    state.push(question);
                    arr = [...state];
                }
                localStorage.setItem('questions', JSON.stringify(arr));
                return arr;
            });
        }
    };

    const saveQuestionHandler = question => {
        updateQuestionsList(state => {
            state[question.index] = question;
            delete state[question.index].index;
            const arr = [...state];
            localStorage.setItem('questions', JSON.stringify(arr));
            return arr;
        });
        updateEditMode(!editMode);
        updateEditmodeQ(null);
    };

    const crossClickedHandler = (e, key) => {
        const copylist = [...questionsList];
        const qIndex = copylist.findIndex(obj => obj.id === key);
        copylist.splice(qIndex, 1);
        copylist.length>0 ? localStorage.setItem('questions', JSON.stringify(copylist)) : localStorage.removeItem('questions');
        updateQuestionsList(copylist);
    };

    const editClickedHandler = (e, key) => {
        const copylist = [...questionsList];
        const qIndex = copylist.findIndex(obj => obj.id === key);
        updateEditMode(!editMode);
        copylist[qIndex].index = qIndex;
        updateEditmodeQ(copylist[qIndex]);
    };

    const moveUpHandler = (key) => {
        updateQuestionsList(state => {
            const copylist = [...state];
            const qIndex = copylist.findIndex(obj => obj.id === key);
            if (qIndex > 0) {
                const temp = copylist[qIndex - 1];
                copylist[qIndex - 1] = copylist[qIndex];
                copylist[qIndex] = temp;
                localStorage.setItem('questions', JSON.stringify(copylist));
            }
            return copylist;
        });
    };

    const moveDownHandler = (key) => {
        updateQuestionsList(state => {
            const copylist = [...state];
            const qIndex = copylist.findIndex(obj => obj.id === key);
            if (qIndex < copylist.length - 1) {
                const temp = copylist[qIndex + 1];
                copylist[qIndex + 1] = copylist[qIndex];
                copylist[qIndex] = temp;
                localStorage.setItem('questions', JSON.stringify(copylist));
            }
            return copylist;
        });
    };

    const duplicateHandler = (key) => {
        updateQuestionsList(state => {
            const copylist = [...state];
            const qIndex = copylist.findIndex(obj => obj.id === key);
            const duplicatedItem = { ...copylist[qIndex], id: Math.random().toString() };
            copylist.splice(qIndex + 1, 0, duplicatedItem);
            localStorage.setItem('questions', JSON.stringify(copylist));
            return copylist;
        });
    };

    const logoutHandler = () => {
        deleteAccessToken();
        deleteRefreshToken();
        document.location.reload();
    };

    const clearStorageHandler = () => {
        localStorage.removeItem('questions');
        document.location.reload();
    };

    const NavigateChangePass = () => {
        navigate('/change-password');
    };

    const NavigateHome = () => {
        navigate('/');
    };

    const appComponents = (
        <>
            <Header
                logout={isLoggedIn}
                buttonClicked={logoutHandler}
                changepass={isLoggedIn}
                textBtn={'Change Password'}
                changePassClicked={NavigateChangePass}
            />
            <SelectList addQuestion={addQuestionHandler} />
            {editMode ? (
                <EditQuestion addQuestion={saveQuestionHandler} editModeQ={editModeQ} />
            ) : (
                <NewQuestion addQuestion={addQuestionHandler} editModeQ={editModeQ} />
            )}
            <QuestionsList
                clearStorage={clearStorageHandler}
                editMode={editMode}
                questionsList={[...questionsList]}
                crossClicked={crossClickedHandler}
                editClicked={editClickedHandler}
                moveUpClicked={moveUpHandler}
                moveDownClicked={moveDownHandler}
                duplicateClicked={duplicateHandler}
            />
            <Output questionsList={questionsList} />
        </>
    );

    return (
        <div className="App">
            {appComponents}
        </div>
    );
}

export default App;
