import {LegalPage} from '@/components/LegalPage';
import {metadataFor} from '@/lib/metadata';
export const metadata=metadataFor('en','terms');
export default function Page(){return <LegalPage locale="en" slug="terms"/>}
