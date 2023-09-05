

interface InputFieldProps {
    labelName: string,
    inputID: string,
    fieldValue: any,
    handleChange: any,
    required?: boolean,
}

/**
 * Subcomponent used to render the input fields for forms. 
 */
export default function InputField(props: InputFieldProps) {
    return (
        <div className="forgot-password-entry-wrapper">
            <div className="forgot-password-entry">
                <div className="forgot-password-slate-entry">
                    <div className="forgot-password-content-wrapper">
                        <div className="forgot-password-input-text">
                            <div id="email-form">
                                <input
                                    value={props.fieldValue}
                                    onChange={props.handleChange}
                                    autoComplete="off"
                                    required={props.required ? props.required : true}
                                    className="forgot-password-text form-control"
                                    name={props.inputID}
                                    type="text"
                                    id={props.inputID}
                                    placeholder={props.labelName} />
                            </div>
                        </div>
                        {props.fieldValue && props.fieldValue.length > 0 && <div className="forgot-passowrd-label-text-wrapper">
                            <div className="forgot-password-label-text">
                                {props.labelName}
                            </div>

                        </div>}

                    </div>
                </div>
            </div>
        </div>
    )
}