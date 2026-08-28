import Styles from './TextInput.module.css';
import Editor from '@monaco-editor/react';
import { useRef, useState } from 'react';

const TextInput = props => {
    const [expand, updateExpand] = useState(false);
    function handleEditorChange(value, event) {
        props.changed(value);
    }

    const expandClickedHandler = () => {
        updateExpand(!expand);
    };

    return (
        <div className={Styles.TextInputGroup + ' ' + Styles[props.groupClass]}>
            <label className={Styles.TextLabel} htmlFor={props.category}>
                {props.label}
                {props.asterick ? <span className="required">*</span> : ''}
            </label>
            {props.category === 'custom' ? (
                <div className={expand ? Styles.Modal : Styles.Editor}>
                    <span onClick={expandClickedHandler} className={Styles.Expand}>
                        {expand ? 'Minimize' : 'Expand'}
                    </span>
                    <Editor
                        onChange={handleEditorChange}
                        value={props.value}
                        width="100%"
                        height="100%"
                        defaultLanguage="sas"
                        id={props.category}
                        name={props.category}
                    />
                </div>
            ) : (
                <input
                    onChange={props.changed}
                    className={`${Styles.TextInput} ${props.questionTypeClass ? Styles[props.questionTypeClass] : ''}`}
                    value={props.value}
                    autoComplete="off"
                    type="text"
                    placeholder={props.placeholder}
                    id={props.category}
                    name={props.category}
                />
            )}
        </div>
    );
};

export default TextInput;
