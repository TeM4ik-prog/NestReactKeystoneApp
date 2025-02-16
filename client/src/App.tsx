import { Suspense, useEffect, useState, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoutesConfig } from '@/types/pagesConfig';
import { AuthService } from './services/auth.service';
import { login, logout, setLoading } from './store/user/user.slice';
import { useDispatch } from 'react-redux';
import { useUpdateUserTrigger } from './store/hooks';
import { onRequest, UserRole } from './types';
import { CategoryService } from './services/category.service';
import { setCategories } from './store/categories/categories.slice';
import { Loader } from './components/ui/Loader';

const MainPage = lazy(() => import('@/pages/MainPage'));
const EntryPage = lazy(() => import('@/pages/EntryPage'));
const PostsPage = lazy(() => import('@/pages/PostsPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));


function App() {
  const dispatch = useDispatch()
  const trigger = useUpdateUserTrigger()

  const checkAuth = async () => {
    dispatch(setLoading(true))
    try {
      const data = await AuthService.getProfile()
      console.log(data)

      if (data) {
        dispatch(login(data))
      } else {
        dispatch(logout())
      }
    } catch (error) {
      console.error("Ошибка при получении профиля:", error)
      dispatch(logout())
    } finally {
      dispatch(setLoading(false))
    }
  }

  const getCategories = async () => {
    const data = await onRequest(CategoryService.getCategories())
    console.log(data)
    if (data) {
      dispatch(setCategories(data))
    }
  }

  useEffect(() => {
    checkAuth()
    getCategories()
  }, [trigger])

  const loaderBlock = () => {
    return (
      <div className="mt-32">
        <Loader />
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-gray-800'>
      <Router>
        <Header />

        <Suspense fallback={loaderBlock()}>

          <main className='p-2 h-full min-h-screen'>

            <Routes>
              <Route path={RoutesConfig.HOME.path} element={<MainPage />} />
              <Route path={RoutesConfig.ENTRY.path} element={<EntryPage />} />
              <Route path={RoutesConfig.CONTACTS.path} element={<ContactPage />} />

              <Route path={`${RoutesConfig.POSTS.path}/:category`} element={<PostsPage />} />

              <Route path='*' element={<NotFoundPage />} />
            </Routes>

          </main>
        </Suspense>
        <Footer />
      </Router>
    </div>
  )
}

export default App