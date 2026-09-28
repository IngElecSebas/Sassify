import QuestionCard from './QuestionCard';
import Styles from './QuestionsList.module.css';

const QuestionsList = props => {
    return (
        <div className={Styles.QuestionsListDiv}>
            <section className={Styles.QuestionsListSection}>
                <button className={Styles.ClearAll} onClick={props.clearStorage} type="button">
                    Clear All
                </button>
                {props.questionsList.length == 0 ? (
                    <div>No questions added yet 😕</div>
                ) : (
                    props.questionsList.map((qObject, index) => (
                        <QuestionCard
                            editMode={props.editMode}
                            crossClicked={props.crossClicked}
                            editClicked={props.editClicked}
                            moveUpClicked={props.moveUpClicked}
                            moveDownClicked={props.moveDownClicked}
                            duplicateClicked={props.duplicateClicked}
                            isFirst={index === 0}
                            isLast={index === props.questionsList.length - 1}
                            key={qObject.id}
                            qObject={qObject}
                        />
                    ))
                )}
            </section>
        </div>
    );
};

export default QuestionsList;
