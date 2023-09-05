
import Link from 'next/link';

type InputTopBarProps = {
    title: string
}


/**
 * On pages where users are inputing data the normal TopBar is removed and this is
 * shown in its place. This is a simpler bar which shows the page title and an 'X' to return to the main page. 
 * Its simple but is used in a few places so it was pulled into its own component to make the code more shareable. 
 */
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