import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
};

export default function Confirm({
  open, onClose, onConfirm,
  title = "Onayla", message, confirmText = "Onayla", danger = false,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Vazgeç</button>
          <button
            className={`btn ${danger ? "bg-rose-600 text-white hover:bg-rose-700" : "btn-primary"}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">{message}</p>
    </Modal>
  );
}
