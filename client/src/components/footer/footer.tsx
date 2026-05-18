import { classNames } from '@/utils/classNames';
import './footer.scss';

type Props = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function Footer(props: Props) {
  const { className } = props;

  return (
    <footer className={classNames('footer', className)}>
      <p className='footer__text'>FACEIT Widgets for OBS</p>
    </footer>
  );
}
