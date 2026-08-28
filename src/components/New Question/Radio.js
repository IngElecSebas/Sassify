import React from 'react';
import Styles from './Radio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDotCircle, faList, faKeyboard, faCode, faExchangeAlt, faDatabase, faAlignLeft 
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'radio/equation': { icon: faDotCircle, class: 'radio-equation' },
    'mcq': { icon: faList, class: 'mcq' },
    'sft': { icon: faAlignLeft, class: 'sft' },
    'array': { icon: faList, class: 'array' }, // Or maybe a different icon
    'customcode': { icon: faCode, class: 'customcode' },
    'midfieldchange': { icon: faExchangeAlt, class: 'midfieldchange' },
    'datacodes': { icon: faDatabase, class: 'datacodes' },
};

const Radio = props => {
    const clicked = e => {
        if (e.target.childElementCount !== 0) {
            e.target.firstElementChild.click();
        }
    };

    const categoryData = iconMap[props.category] || { icon: faDotCircle, class: '' };

    return (
        <div onClick={clicked} className={`${Styles.RadioGroup} ${Styles[categoryData.class]}`}>
            <input
                className={Styles.InputRadio}
                onChange={props.clicked}
                type="radio"
                id={props.category}
                name="qtype"
                checked={props.defaultQ === props.category}
                value={props.category}
            />
            <label className={Styles.RadioLabel} htmlFor={props.category}>
                <FontAwesomeIcon icon={categoryData.icon} style={{ marginRight: '8px' }} />
                {props.label}
            </label>
        </div>
    );
};

export default Radio;

