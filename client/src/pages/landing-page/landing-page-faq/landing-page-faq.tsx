import { useCallback, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { LANDING_FAQ_ITEMS } from '@/seo/landingFaq';
import { LandingPageFaqItem } from './landing-page-faq-item/landing-page-faq-item';
import './landing-page-faq.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function LandingPageFaq(props: Props) {
  const { className } = props;
  const [ openQuestion, setOpenQuestion ] = useState<string | null>(null);

  const toggleQuestion = useCallback((question: string) => {
    setOpenQuestion((current) => (current === question ? null : question));
  }, []);

  return (
    <section className={classNames('landing-page-faq', className)}>
      <h2 className='landing-page-faq__title'>Частые вопросы про виджет Faceit</h2>
      <div className='landing-page-faq__list'>
        {LANDING_FAQ_ITEMS.map((item) => (
          <LandingPageFaqItem
            key={item.question}
            question={item.question}
            answer={item.answer}
            isOpen={openQuestion === item.question}
            onToggle={toggleQuestion}
          />
        ))}
      </div>
    </section>
  );
}
