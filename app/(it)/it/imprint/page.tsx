import {LegalPage} from '@/components/LegalPage';
import {metadataFor} from '@/lib/metadata';
export const metadata=metadataFor('it','imprint');
export default function Page(){return <LegalPage locale="it" slug="imprint"/>}
