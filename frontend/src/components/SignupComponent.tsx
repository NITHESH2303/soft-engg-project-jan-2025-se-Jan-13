import { useState } from "react"
import Button from "./ui/Button"
import InputPassword from "./ui/InputPassword"
import InputText from "./ui/InputText"

export default function SignupComponent(){
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const onClick = () => {
  }

  return(
    <form className='max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8'>
      <h2 className='text-4xl dark:text-white font-bold text-center'>SignUp</h2>

      <div className='flex flex-col text-gray-400 py-2'>
          <InputText label="Full Name" placeholder="Full Name" type="text" setter={setName}/>
      </div>
      <div className='flex flex-col text-gray-400 py-2'>
          <InputText label="Contact Number" placeholder="Number" type="number" setter={setNumber}/>
      </div>
      <div className='flex flex-col text-gray-400 py-2'>
          <InputText label="Email Address" placeholder="abc@gmail.com" type="email" setter={setEmail}/>
      </div>
      <div className='flex flex-col text-gray-400 py-2'>
          <InputPassword password={password} setPassword={setPassword}/>
      </div>
      <div className='flex justify-between text-gray-400 py-2'>
          <p className='flex items-center'><input className='mr-2' type="checkbox" /> Remember Me</p>
      </div>
      <Button label="Signup" onClick={onClick}/>
      <div className='text-white'>Already have an account? <a href="/" className='text-blue-500 underline hover:text-blue-600'>Login</a></div>
  </form>
  )
}