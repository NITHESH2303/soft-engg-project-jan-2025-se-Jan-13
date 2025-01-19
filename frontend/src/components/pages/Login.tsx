import loginImg from '../../assets/login.jpeg'
import LoginComponent from '../LoginComponent';

export default function Login() {

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
        <div className='hidden sm:block bg-gray-800'>
            <img className='w-full h-screen object-fill' src={loginImg} alt="" />
        </div>

        <div className='bg-gray-800 flex flex-col justify-center items-center'>
            <LoginComponent />
        </div>
    </div>
  )
}