import './elo-icon.scss';
import { classNames } from '@utils/classNames';

interface Props {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения иконки FACEIT ELO. */
export function EloIcon(props: Props) {
  const { className } = props;

  return <span className={classNames('elo-icon', className)}/>;
}
