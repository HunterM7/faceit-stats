import { classNames } from '@/utils/classNames';
import { LANDING_TOPICS } from '@/seo/landingTopics';
import './landing-page-topics.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function LandingPageTopics(props: Props) {
  const { className } = props;

  return (
    <section className={classNames('landing-page-topics', className)}>
      {LANDING_TOPICS.map((topic) => (
        <article key={topic.title} className='landing-page-topics__item'>
          <h2 className='landing-page-topics__title'>{topic.title}</h2>
          <p className='landing-page-topics__text'>{topic.text}</p>
        </article>
      ))}
    </section>
  );
}
