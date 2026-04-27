import './skill-level-icon.scss'
import { classNames } from '@utils/classNames'

interface Props {
  /** Уровень навыка игрока (1-20). */
  level: number;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения иконки уровня навыка игрока. */
export function SkillLevelIcon(props: Props) {
  const { level, className } = props;

  return <span className={classNames('skill-level-icon', `skill-level-icon--${level}`, className)}/>
}
