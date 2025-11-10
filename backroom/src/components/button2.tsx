export default function Button2({text}: {text: string}) {
    return (
      <button className="relative bg-violet-400 hover:bg-violet-300 text-black cursor-pointer px-4 py-1">
  
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          <CornerPlus />
        </div>
  
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2">
          <CornerPlus />
        </div>
  
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
          <CornerPlus />
        </div>
  
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2">
          <CornerPlus />
        </div>
  
        {text}
      </button>
    );
  }
  
  function CornerPlus() {
    return (
      <div className="relative w-3 h-3">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white -translate-x-1/2" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white -translate-y-1/2" />
      </div>
    );
  }
  