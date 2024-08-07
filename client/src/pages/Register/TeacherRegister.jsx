import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import BASE_URL from '../../constants';

const TeacherRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const sendVerificationCode = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const loadingToast = toast.loading('Sending verification code...');
    try {
      await axios.post(`${BASE_URL}/api/send-verification-code`, { email });
      toast.dismiss(loadingToast);
      toast.success('Verification code sent');
      setIsVerifying(true);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.log(err.message);
      toast.error('Failed to send verification code');
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const loadingToast = toast.loading('Verifying code...');
    try {
      const result = await axios.post(`${BASE_URL}/api/verify-code`, { email, code });
      toast.dismiss(loadingToast);
      if (result.data.message === 'Code verified') {
        handleSubmit();
      } else {
        toast.error('Invalid code');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.log(err.message);
      toast.error('Code verification failed');
    }
  };

  const handleSubmit = async () => {
    const loadingToast = toast.loading('Signing up...');

    try {
      let image = '';
      let contact = '8800XXXXXX';
      let description = `Educator with ${experience} years of experience in ${subject}, fostering a positive learning environment.`;
      const result = await axios.post(`${BASE_URL}/api/teacher-register`, {
        name, email, password, subject, experience, location, contact, description, image
      });
      toast.dismiss(loadingToast);

      if (result.data.message === 'User not created') {
        toast.error(result.data.message);
      } else {
        toast.success('User registered.');
        navigate('/teacher-login');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
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
                <img loading='lazy'  src="/logo.png" alt="Logo" className='w-40 mb-1 ml-[-10px]' />
                <h1 className='text-[#353452] text-3xl  font-semibold mb-5'>
                  <span className='bg-gradient-to-r from-pink-400 to-rose-500 text-transparent bg-clip-text font-bold'>Teacher</span> SignUp
                </h1>
                <form onSubmit={isVerifying ? verifyCode : sendVerificationCode} className='flex flex-col '>
                {!isVerifying ? (
                  <>
                  <div className='w-full flex gap-2'>
                    <div className='flex-1 flex flex-col'>
                    
                      <label htmlFor="name" className='text-sm text-[#353452] ms-1'>Name</label>
                      <input
                        type='text'
                        name='name'
                        placeholder='Enter Name...'
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        className='py-3 px-2  rounded-md bg-purple-100 border-4 border-white'
                        required
                      />
                    </div>
                    <div className='flex-1 flex flex-col'>
                      <label htmlFor="experience" className='text-sm text-[#353452] ms-1'>Experience</label>
                      <input
                        type='number'
                        name='experience'
                        placeholder='Years'
                        onChange={(e) => setExperience(e.target.value)}
                        value={experience}
                        className='py-3 px-2  rounded-md bg-purple-100  border-4 border-white'
                        required
                      />
                    </div>
                  </div>

                  <label htmlFor="email" className='text-sm text-[#353452] ms-1 mt-2'>Email</label>
                  <input
                    type='email'
                    name='email'
                    placeholder='Enter Email...'
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className='py-3 px-2  rounded-md bg-purple-100 border-4 border-white'
                    required
                  />
                  <div className='w-full flex gap-2 mt-2'>
                    <div className='flex-1 flex flex-col'>
                      <label htmlFor="subject" className='text-sm text-[#353452] ms-1'>Subject</label>
                      <input
                        type='text'
                        name='subject'
                        placeholder='Enter Subject...'
                        onChange={(e) => setSubject(e.target.value)}
                        value={subject}
                        className='py-3 px-2  rounded-md bg-purple-100  border-4 border-white'
                        required
                      />
                    </div>
                    <div className='flex-1 flex flex-col'>
                      <label htmlFor="location" className='text-sm text-[#353452] ms-1'>Location</label>
                      <input
                        type='text'
                        name='location'
                        placeholder='Enter Location...'
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                        className='py-3 px-2  rounded-md bg-purple-100  border-4 border-white'
                        required
                      />
                    </div>
                  </div>
                  <label htmlFor="password" className='text-sm text-[#353452] ms-1 mt-3' >Password</label>
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
                    Send Verification Code
                  </button>
                  </>
                  ) : (
                    <>
                      <label htmlFor="code" className='text-sm text-[#353452] ms-1'>Verification Code</label>
                      <input
                        type='text'
                        name='code'
                        placeholder='Enter Verification Code...'
                        onChange={(e) => setCode(e.target.value)}
                        value={code}
                        className='py-3 px-2 rounded-md bg-purple-100 mb-5 border-4 border-white'
                        required
                      />
                      <button type='submit' className='bg-gradient-to-r text-xl text-white font-bold from-fuchsia-400 to-purple-500  py-2 rounded-md  duration-150'>
                        Verify Code
                      </button>
                    </>
                  )}
                </form>
                <p className='mt-3 text-gray-600'>
                  Already registered? <Link to='/teacher-login' className='text-blue-500 underline'>Login</Link>
                </p>
              </div>
            </div>
            <div className='flex-1 max-w-[550px] object-cover max-md:hidden p-5 pl-0' >
              <img src="/assets/images/register.png" alt="Login Banner" />
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default TeacherRegister;
