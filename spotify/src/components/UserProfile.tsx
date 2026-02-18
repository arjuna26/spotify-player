import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 bg-zinc-800 rounded-full" />
        <div className="h-4 w-24 bg-zinc-800 rounded" />
      </div>
    );
  }

  const isPremium = user.product === 'premium';

  return (
    <div className="flex items-center gap-3">
      {user.images?.[0]?.url ? (
        <img
          src={user.images[0].url}
          alt={user.display_name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-800"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-400 text-sm font-medium">
            {user.display_name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-medium">
          {user.display_name}
        </span>
        {isPremium && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#1DB954]/20 text-[#1DB954] rounded">
            Premium
          </span>
        )}
      </div>
    </div>
  );
}
