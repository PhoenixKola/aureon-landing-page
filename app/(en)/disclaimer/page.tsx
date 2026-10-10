import {LegalPage} from '@/components/LegalPage';
import {metadataFor} from '@/lib/metadata';
export const metadata=metadataFor('en','disclaimer');
export default function Page(){return <LegalPage locale="en" slug="disclaimer"/>}
