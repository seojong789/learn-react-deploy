import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// import BlogPage, { loader as postsLoader } from './pages/Blog'; 해당 페이지 지연 로딩을 위해 제거
import { lazy, Suspense } from 'react';
import HomePage from './pages/Home';
// import PostPage, { loader as postLoader } from './pages/Post';
import RootLayout from './pages/Root';

/*
BlogPage에 지연 로딩 적용
const BlogPage = () => import('./pages/Blog') 코드는 틀린 접근!!
함수가 유효한 컴포넌트 함수가 되려면 JSX 코드같은 것들을 반환해야 하는데, 위의 코드는 Promise를 반환하고 있음.
해결 - lazy 함수를 사용하면 된다. (매개변수로 동적 import를 받는다.)
즉, lazy를 사용하면 Component로 사용이 가능함. const BlogPage -> <BLogPage />로 사용할 수 있는 것임.
*/
const BlogPage = lazy(() => import('./pages/Blog'));
const PostPage = lazy(() => import('./pages/Post'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'posts',
        children: [
          {
            index: true,
            element: (
              /*
              Suspense Component : 
              다른 Component를 사용하여 실제로 컨텐츠를 렌더링하기 전에..
              즉, 해당 컨텐츠의 로딩을 기다리는 동안 로딩 상태를 fallback 속성으로 보여주기 위해 사용함.
              */
              <Suspense fallback={<p>Loading...</p>}>
                <BlogPage />
              </Suspense>
            ),
            /* 
            import() 함수는 비동기 함수로 Promise를 반환함. 따라서 .then을 사용할 수 있음. 
            module : import 함수로 PagesBlog 컴포넌트 모듈을 얻어온 것. 즉, 해당 모듈에 loader를 적용함.
            최종적으로 해당 BLogPage의 loader는 module.loader()의 반환 값(Promise)을 받는다. 
            비동기라 결국은 지연로딩이 된다. 즉, 해당 import 함수는 BLogPage의 loader가 실행될 때(블로그 페이지에 방문할 때) 동작한다.
            */
            loader: () =>
              import('./pages/Blog').then((module) => module.loader()),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<p>Loading...</p>}>
                <PostPage />
              </Suspense>
            ),
            /* 
            BlogPage의 action은 라우터에 의해 request, params를 안 받지만, 
            Postpage의 action은 params를 받아서 사용하고 있다.
            */
            loader: ({ params }) =>
              import('./pages/Post').then((module) =>
                module.loader({ params })
              ),
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
