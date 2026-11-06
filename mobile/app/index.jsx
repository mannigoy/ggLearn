import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext.jsx';
import { routeFor } from '../src/context/routeFor.js';

const HOME = { auth: '/login', pending: '/pending', tabs: '/courses' };

/** "/" has no screen of its own: send each user to the part of the app their role allows. */
export default function Index() {
  const { profile } = useAuth();
  return <Redirect href={HOME[routeFor(profile)]} />;
}
