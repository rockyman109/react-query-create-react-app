import './App.css'
import PostList from './components/PostList.jsx'
const App=() => {


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 max-w-4xl bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          React Query
        </h1>
        <PostList />
      </div>
    </div>
  )
}

export default App
