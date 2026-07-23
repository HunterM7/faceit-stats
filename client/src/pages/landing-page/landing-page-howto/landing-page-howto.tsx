import { classNames } from '@/utils/classNames';
import { LANDING_HOWTO_DESCRIPTION, LANDING_HOWTO_NAME, LANDING_HOWTO_STEPS } from '@/seo/landingHowTo';
import './landing-page-howto.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function LandingPageHowto(props: Props) {
  const { className } = props;

  return (
    <section className={classNames('landing-page-howto', className)}>
      <h2 className='landing-page-howto__title'>{LANDING_HOWTO_NAME}</h2>
      <p className='landing-page-howto__lead'>{LANDING_HOWTO_DESCRIPTION}</p>
      <ol className='landing-page-howto__steps'>
        {LANDING_HOWTO_STEPS.map((step, index) => (
          <li key={step.name} className='landing-page-howto__step'>
            <span className='landing-page-howto__step-index'>{index + 1}</span>
            <div className='landing-page-howto__step-body'>
              <h3 className='landing-page-howto__step-name'>{step.name}</h3>
              <p className='landing-page-howto__step-text'>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
