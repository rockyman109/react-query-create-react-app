import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, fetchTags, addPost } from '../api/index.js';
import { useState } from 'react';
import Modal from './Modal.jsx';

import { v4 as uuidv4 } from 'uuid';

const PostList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const queryClient = useQueryClient();

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const { data: listData, isLoading, isError, error, isPlaceholderData } = useQuery({
        queryKey: ["posts", { page }],
        queryFn: () => fetchPosts(page),
        staleTime: 1000 * 60 * 5,
    });

    // console.log("listData===", listData);

    const { data: tagsData } = useQuery({
        queryKey: ["tags"],
        queryFn: fetchTags,
        staleTime: Infinity,
    });

    const { mutate, isError: isPostError, isPending } = useMutation({
        mutationFn: addPost,
        retry: 3,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["posts"], exact: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts", { page }],
            });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = formData.get("postTitle");
        const tags = Array.from(formData.keys()).filter(
            (key) => formData.get(key) === "on"
        );

        if (!title || !tags.length) return;
        const payload = {
            id: String(listData?.items+1),
            // id: uuidv4(),
            title,
            tags,
        };
        mutate(payload);

        e.target.reset(); // reset form
        closeModal(); // close modal after submission
    };

    console.log("error==",error);
    return (
        <div className="container mx-auto p-4 max-w-4xl bg-gray-100">
            <div className="flex justify-end mb-2">
                <button
                    onClick={openModal}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                    Create Post
                </button>
            </div>
            {isLoading && isPending && <p className="text-blue-500">Loading....</p>}
            {isError && <p className="text-red-500">{error.message}</p>}
            {isPostError && <p className="text-red-500">Something went wrong</p>}
            {listData?.data?.map((post) => (
                <div key={post.id} className="post p-4 mb-4 border border-gray-200 rounded-lg shadow-lg bg-white">
                    <div className="post-title text-2xl font-bold mb-2">{post.title}</div>
                    <div className="post-tags">
                        {post.tags.map((tag, ind) => (
                            <span key={ind} className="tag inline-block bg-blue-200 text-blue-800 text-sm px-2 py-1 rounded-full mr-2">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}

            {/* Pagination */}
            <div className="pagination flex justify-center items-center space-x-4 mt-4">
                <button
                    onClick={() => setPage((old) => Math.max(old - 1, 0))}
                    disabled={!listData?.prev}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                    Previous Page
                </button>
                <span className="text-lg font-medium">{page}</span>
                <button
                    onClick={() => {
                        if (!isPlaceholderData && listData?.next) {
                            setPage((old) => old + 1);
                        }
                    }}
                    disabled={isPlaceholderData || !listData?.next}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                    Next Page
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-2xl font-bold mb-4">Create Post</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            name="postTitle"
                            placeholder="Enter your post here.."
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="input-tags">
                        {tagsData?.map((tag) => (
                            <div key={tag.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name={tag.name}
                                    id={tag.name}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={tag.name} className="text-sm font-medium text-gray-700">
                                    {tag.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default PostList;
