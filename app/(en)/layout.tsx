import type {ReactNode} from 'react';
import {HtmlLayout} from '@/components/DocumentShell';
import '../globals.css';
export default function Layout({children}:{children:ReactNode}) {return <HtmlLayout locale="en">{children}</HtmlLayout>}
