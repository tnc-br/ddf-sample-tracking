
import Link from 'next/link';

type InputTopBarProps = {
    title: string
}

export default function InputTopBar(props: InputTopBarProps) {
    return (
        <div className="page-title-wrapper">
            <Link href="./samples" className="close-icon"><span className="material-symbols-outlined add-sample-close-icon">
                close
            </span></Link>
            <div className="page-title-text">
                {props.title}
            </div>
        </div>
    )

}