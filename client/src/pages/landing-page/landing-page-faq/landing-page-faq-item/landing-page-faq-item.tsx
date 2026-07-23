import { useCallback } from 'react';
import { classNames } from '@/utils/classNames';
import './landing-page-faq-item.scss';

interface Props {
  /** Текст вопроса. */
  question: string;
  /** Текст ответа (показывается при раскрытии). */
  answer: string;
  /** Раскрыт ли ответ. */
  isOpen: boolean;
  /** Переключает раскрытие по тексту вопроса. */
  onToggle: (question: string) => void;
}

export function LandingPageFaqItem(props: Props) {
  const { question, answer, isOpen, onToggle } = props;

  const handleClick = useCallback(() => {
    onToggle(question);
  }, [ onToggle, question ]);

  return (
    <div className='landing-page-faq-item'>
      <button type='button' className='landing-page-faq-item__question' onClick={handleClick}>
        <span className='landing-page-faq-item__question-text'>{question}</span>
        <span
          className={classNames(
            'landing-page-faq-item__chevron',
            isOpen && 'landing-page-faq-item__chevron--open',
          )}
        />
      </button>
      <div
        className={classNames(
          'landing-page-faq-item__answer',
          isOpen && 'landing-page-faq-item__answer--open',
        )}
      >
        <div className='landing-page-faq-item__answer-body'>
          <p
            className={classNames(
              'landing-page-faq-item__answer-text',
              isOpen && 'landing-page-faq-item__answer-text--open',
            )}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
