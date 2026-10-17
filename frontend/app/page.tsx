import {redirect} from 'next/navigation';

/**
 * The app opens on the splash screen (DESIGN.md section 6.1), which then sends
 * the member to Home or Login. `/` is the only entry point handed out.
 */
export default function RootPage() {
  redirect('/splash');
}
