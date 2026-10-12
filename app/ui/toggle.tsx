export default function Toggle({ checked, onChange }: {checked: boolean, onChange: (checked: boolean) => void}) {
  return (
    <>
        <p className="pl-3 text-[10px] md:text-[15px]"> Open article links in new tab </p>
        <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`rounded-full md:p-0.5 h-4 w-7 transition-colors duration-200  
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
            md:h-7 md:w-12
            ${checked ? "bg-blue-400" : "bg-gray-300"}`}
        >
        <span
            className={`block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200
              md:h-6 md:w-6
            ${checked ? "translate-x-3 md:translate-x-5" : "translate-x-1 md:translate-x-0"}`}
        />
        </button>
    </>
  );
}