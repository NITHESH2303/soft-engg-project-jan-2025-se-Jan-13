export default function Button({ label, onClick }: { label:string, onClick: ()=>void }){
  return(
    <button className='w-full mt-2 mb-3 py-2 bg-teal-500 shadow-md shadow-teal-300/50 hover:shadow-teal-400/50 hover:bg-teal-600 text-white font-semibold rounded-lg'
            onClick={onClick}>
      {label}
    </button>
  )
}