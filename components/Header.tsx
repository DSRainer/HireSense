'use client';

import { signOut } from '@/lib/actions/auth.action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className='flex items-center gap-2'>
        <Image src="/logo.svg" alt='logo' width={38} height={32} />
        <h2 className="text-primary-100">HireSense</h2>
      </Link>
      <button
        onClick={handleSignOut}
        className="text-sm font-medium text-primary-100 hover:text-slate-500 transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </nav>
  );
};

export default Header;
