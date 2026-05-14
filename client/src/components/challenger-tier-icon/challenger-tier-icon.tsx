import { classNames } from '@utils/classNames';
import { ChallengerTier } from './utils/interface';
import './challenger-tier-icon.scss';

export { ChallengerTier };

interface Props {
  /** Ступень Challenger. */
  tier?: ChallengerTier | undefined;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения иконки ступени Challenger. */
export function ChallengerTierIcon(props: Props) {
  const { tier = ChallengerTier.Other, className } = props;
  return <span className={classNames('challenger-tier-icon', `challenger-tier-icon--${tier}`, className)}/>;
}
