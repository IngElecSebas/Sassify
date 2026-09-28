import Styles from './QuestionCard.module.css';

const QuestionCard = props => {
    return (
        <div className={Styles.QCardContainer}>
            {props.editMode ? null : (
                <>
                <div className={Styles.Cross} title="Delete" onClick={e => props.crossClicked(e, props.qObject.id)}>
                    <span>x</span>
                </div>
                <div className={Styles.Edit} title="Edit" onClick={e => props.editClicked(e, props.qObject.id)}>
                    <img src="https://img.icons8.com/external-anggara-glyph-anggara-putra/64/000000/external-edit-basic-ui-anggara-glyph-anggara-putra.png" />
                </div>
                {!props.isFirst && (
                    <div className={Styles.MoveUp} title="Move Up" onClick={e => props.moveUpClicked(props.qObject.id)}>
                        <span>▲</span>
                    </div>
                )}
                {!props.isLast && (
                    <div className={Styles.MoveDown} title="Move Down" onClick={e => props.moveDownClicked(props.qObject.id)}>
                        <span>▼</span>
                    </div>
                )}
                <div className={Styles.InsertBtn} title="Duplicate / Insert" onClick={e => props.duplicateClicked(props.qObject.id)}>
                    <span>+ Insert</span>
                </div>
                </>
            )}
            {props.qObject.questionCode ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="qcode">Question Code:</label>
                    <input type="text" id="qcode" defaultValue={props.qObject.questionCode} readOnly />
                </div>
            ) : null}
            <div className={Styles.CardGroup}>
                <label htmlFor="qtype">Question Type:</label>
                <input type="text" id="qtype" defaultValue={props.qObject.questionType} readOnly />
            </div>
            {props.qObject.answerOptions ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="aoptions">Answer Options:</label>
                    <input type="text" id="aoptions" defaultValue={props.qObject.answerOptions} readOnly />
                </div>
            ) : null}
            {props.qObject.subQuestions ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="subquestion">Sub Questions:</label>
                    <input type="text" id="subquestions" defaultValue={props.qObject.subQuestions} readOnly />
                </div>
            ) : null}
            {props.qObject.skipLogic ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Skip Logic:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.skipLogic} readOnly />
                </div>
            ) : null}
            {props.qObject.otherCode ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Other Code:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.otherCode} readOnly />
                </div>
            ) : null}
            {props.qObject.exclusiveOption ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Exclusive:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.exclusiveOption} readOnly />
                </div>
            ) : null}
            {props.qObject.minMax ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Min,Max:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.minMax} readOnly />
                </div>
            ) : null}
            {props.qObject.oldLogic ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Old Logic:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.oldLogic} readOnly />
                </div>
            ) : null}
            {props.qObject.newLogic ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">New Logic:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.newLogic} readOnly />
                </div>
            ) : null}
            {props.qObject.changeDate ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Change Date:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.changeDate} readOnly />
                </div>
            ) : null}
            {props.qObject.demoRefusals ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Demo Refusals:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.demoRefusals} readOnly />
                </div>
            ) : null}
            {props.qObject.langQ ? (
                <div className={Styles.CardGroup}>
                    <label htmlFor="slogic">Language Question:</label>
                    <input type="text" id="slogic" defaultValue={props.qObject.langQ} readOnly />
                </div>
            ) : null}
        </div>
    );
};

export default QuestionCard;
