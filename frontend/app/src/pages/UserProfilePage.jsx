import React from 'react';
import { useParams } from 'react-router-dom';

const fakeUserData = {
    id: 1,
    name: 'John Doe',
    picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=2080&auto=format&fit=crop',
    bio: '28, Software Engineer. I enjoy hiking, photography, and exploring new cultures. Looking for a travel companion for my next adventure.',
    followers: 1258,
    posts: [
        { id: 1, image: 'https://picsum.photos/seed/post1/500/500', caption: 'Hiking in the mountains!' },
        { id: 2, image: 'https://picsum.photos/seed/post2/500/500', caption: 'Amazing street food.' },
        { id: 3, image: 'https://picsum.photos/seed/post3/500/500', caption: 'Sunset at the beach.' },
        { id: 4, image: 'https://picsum.photos/seed/post4/500/500', caption: 'City lights.' },
        { id: 5, image: 'https://picsum.photos/seed/post5/500/500', caption: 'Exploring the old town.' },
        { id: 6, image: 'https://picsum.photos/seed/post6/500/500', caption: 'Morning coffee with a view.' },
    ]
};

const UserProfilePage = () => {
    const { userId } = useParams();
    // In a real app, you'd fetch user data based on userId
    const user = fakeUserData;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="flex items-center mb-8">
                    <img src={user.picture} alt={user.name} className="w-32 h-32 rounded-full object-cover mr-8 shadow-lg" />
                    <div>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <div className="flex items-center space-x-6 mt-2 text-gray-600">
                            <p><span className="font-bold text-black">{user.posts.length}</span> posts</p>
                            <p><span className="font-bold text-black">{user.followers}</span> followers</p>
                        </div>
                        <p className="mt-4 text-gray-700">{user.bio}</p>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="grid grid-cols-3 gap-4">
                        {user.posts.map(post => (
                            <div key={post.id} className="relative aspect-square group">
                                <img src={post.image} alt={post.caption} className="w-full h-full object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                                    <p className="text-white opacity-0 group-hover:opacity-100 transition">{post.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
