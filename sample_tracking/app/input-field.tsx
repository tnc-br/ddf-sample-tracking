

interface SignUpProps {
    labelName: string,
    inputID: string,
    fieldValue: any,
    handleChange: any,
}

export default function InputField(props: SignUpProps) {
    return (
        <div className="forgot-password-entry-wrapper">
                    <div className="forgot-password-entry">
                        <div className="forgot-password-slate-entry">
                            <div className="forgot-password-content-wrapper">
                                <div className="forgot-password-input-text">
                                    <div id="email-form">
                                        <input value={props.fieldValue} onChange={props.handleChange} autoComplete="off" required className="forgot-password-text form-control" name={props.inputID} type="text" id={props.inputID} />
                                    </div>
                                </div>
                                <div className="forgot-passowrd-label-text-wrapper">
                                    <div className="forgot-password-label-text">
                                        {props.labelName}
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
    )
}