import {LegalPage} from '@/components/LegalPage';
import {metadataFor} from '@/lib/metadata';
export const metadata=metadataFor('en','privacy');
export default function Page(){return <LegalPage locale="en" slug="privacy"/>}
