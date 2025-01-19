import { SetStateAction } from "react";

export default function InputText({ label, placeholder, setter, type }: {label:string, placeholder: string, setter: React.Dispatch<SetStateAction<string>>, type:string }){
  return(
    <>
      <label>{label}</label>
      <input className='rounded-lg border border-1 border-teal-200 bg-gray-700 mt-2 p-2 focus:border-teal-500 focus:bg-gray-800 focus:outline-none' 
      type={type} placeholder={placeholder} onChange={(e)=>setter(e.target.value)}/>
    </>
  )
}