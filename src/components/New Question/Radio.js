import React from 'react';
import Styles from './Radio.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDotCircle, faList, faCode, faExchangeAlt, faDatabase, faAlignLeft 
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    'radio/equation': { icon: faDotCircle, class: 'selected-radio-equation' },
    'mcq': { icon: faList, class: 'selected-mcq' },
    'sft': { icon: faAlignLeft, class: 'selected-sft' },
    'array': { icon: faList, class: 'selected-array' },
    'customcode': { icon: faCode, class: 'selected-customcode' },
    'midfieldchange': { icon: faExchangeAlt, class: 'selected-midfieldchange' },
    'datacodes': { icon: faDatabase, class: 'selected-datacodes' },
};

const Radio = props => {
    const clicked = e => {
        if (e.target.childElementCount !== 0) {
            e.target.firstElementChild.click();
        }
    };

    const isSelected = props.defaultQ === props.category;
    const categoryData = iconMap[props.category] || { icon: faDotCircle, class: '' };

    return (
        <div onClick={clicked} className={`${Styles.RadioGroup} ${isSelected ? Styles[categoryData.class] : ''}`}>
            <input
                className={Styles.InputRadio}
                onChange={props.clicked}
                type="radio"
                id={props.category}
                name="qtype"
                checked={isSelected}
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


