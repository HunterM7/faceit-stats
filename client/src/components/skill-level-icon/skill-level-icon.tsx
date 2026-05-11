import './skill-level-icon.scss'
import { classNames } from '@utils/classNames'

interface Props {
  /** Уровень навыка игрока (1-20). */
  skillLevel: number;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения иконки уровня навыка игрока. */
export function SkillLevelIcon(props: Props) {
  const { skillLevel, className } = props;

  return <span className={classNames('skill-level-icon', `skill-level-icon--${skillLevel}`, className)}/>
}
