import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post('http://localhost:3000/api/student-register', { name, email, password });
      if (result.data === 'User not created') {
        toast.error(result.data);
      } else {
        toast.success('User registered.');
        navigate('/student-login');
      }
    } catch (err) {
      console.log(err.message);
      toast.error('Registration failed');
    }
  };

  return (
    <div className='bg-gradient-to-r from-fuchsia-200 via-indigo-100 to bg-purple-300 min-h-screen flex flex-col  items-center bg-cover pb-20'>
      <section className='w-full py-10'>
        <div className='flex flex-col justify-center items-center h-full'>
          <div className='flex flex-row rounded-3xl bg-white shadow-2xl'>
            
            <div className='flex-1 flex items-center'>
              <div className='flex flex-col w-full bg-white p-10 text-black rounded-3xl '>
                <img src="/logo.png" alt="Logo" className='w-40 mb-1 ml-[-10px]' />
                <h1 className='text-[#353452] text-5xl  font-semibold mb-5'>
                  <span className='bg-gradient-to-r from-pink-400 to-rose-500 text-transparent bg-clip-text font-bold'>Student</span> SignUp
                </h1>
                <p className='mb-4 text-gray-500'>Connect With the Best Teachers Near You</p>
                <form onSubmit={handleSubmit} className='flex flex-col '>
                  <label htmlFor="name" className='text-sm text-[#353452] ms-1'>Name</label>
                  <input
                    type='name'
                    name='name'
                    placeholder='Enter Name...'
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className='py-3 px-2 rounded-md bg-purple-100 mb-5 border-4 border-white'
                    required
                  />
                  <label htmlFor="email" className='text-sm text-[#353452] ms-1'>Email</label>
                  <input
                    type='email'
                    name='email'
                    placeholder='Enter Email...'
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className='py-3 px-2  rounded-md bg-purple-100 border-4 border-white'
                    required
                  />
                  <label htmlFor="password" className='text-sm text-[#353452] ms-1 mt-5' >Password</label>
                  <input
                    type='password'
                    name='password'
                    placeholder='Enter Password...'
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className='py-3 px-2  rounded-md bg-purple-100 border-4 mb-5 border-white'
                    required
                  />
                  
                  <button type='submit' className='bg-gradient-to-r text-xl text-white font-bold from-fuchsia-400 to-purple-500  py-2 rounded-md  duration-150'>
                    Submit
                  </button>
                </form>
                <p className='mt-3 text-gray-600'>
                  Already registered? <Link to='/student-login' className='text-blue-500 underline'>Login</Link>
                </p>
              </div>
            </div>
            <div className='flex-1 max-w-[550px] object-cover max-md:hidden p-5 pl-0' >
              <img src="./src/assets/images/register.png" alt="Login Banner" />
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default StudentRegister;
