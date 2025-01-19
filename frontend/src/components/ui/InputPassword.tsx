import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye'
import { SetStateAction, useState } from 'react';

export default function InputPassword({ setPassword, password }: { password:string, setPassword: React.Dispatch<SetStateAction<string>> }){
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type==='password'){
       setIcon(eye);
       setType('text')
    } else {
       setIcon(eyeOff)
       setType('password')
    }
  }

  return(
    <>
    <label>Password</label>
    <input
        type={type}
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        
        className='p-2 border border-1 border-teal-200 rounded-lg bg-gray-700 mt-2 focus:border-teal-500 focus:bg-gray-800 focus:outline-none'
    ></input>
    <a className="mt-2 ml-1 flex items-center text-sm hover:cursor-pointer" onClick={handleToggle}>
        Password Visibility  
        <Icon className="ml-2 mb-1" icon={icon} size={15}/>
    </a>
    </>
  )
}