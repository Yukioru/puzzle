import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { AccentIconFrame } from "~/components/AccentIconFrame";
import { Button } from "~/components/Button";

export default function DemoButtons() {

  const iconConfirm = (
    <AccentIconFrame>
      <FaCheck />
    </AccentIconFrame>
  );

  const iconDecline = (
    <AccentIconFrame>
      <IoClose style={{ fontSize: '1.9rem' }} />
    </AccentIconFrame>
  );

  return (
    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-start' }}>
      <Button icon={iconConfirm}>Подтвердить</Button>
      <Button icon={iconConfirm} disabled>Подтвердить</Button>
      <Button icon={iconDecline}>Отменить</Button>
      <Button icon={iconDecline} disabled>Отменить</Button>
    </div>
  )
}