export default function Toggle({ checked, onChange }: {checked: boolean, onChange: (checked: boolean) => void}) {
  return (
    <>
        <p className="pl-3"> Open article links in new tab </p>
        <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`h-7 w-12 rounded-full p-0.5 transition-colors duration-200
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
            ${checked ? "bg-blue-400" : "bg-gray-300"}`}
        >
        <span
            className={`block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
        </button>
    </>
  );
}