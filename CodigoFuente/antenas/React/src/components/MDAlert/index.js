import { useState } from "react";
import PropTypes from "prop-types";
import Fade from "@mui/material/Fade";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDAlertRoot from "components/MDAlert/MDAlertRoot";
import MDAlertCloseIcon from "components/MDAlert/MDAlertCloseIcon";

function MDAlert({
  color,
  dismissible,
  children,
  onDismiss,
  onConfirm,
  onCancel,
  showActions,
  ...rest
}) {
  const [alertStatus, setAlertStatus] = useState("mount");

  const handleAlertStatus = () => setAlertStatus("fadeOut");

  const alertTemplate = (mount = true) => (
    <Fade in={mount} timeout={300} onExited={() => onDismiss && onDismiss()}>
      <MDAlertRoot ownerState={{ color }} {...rest}>
        <MDBox display="flex" alignItems="center" color="white">
          {children}
        </MDBox>
        {dismissible ? (
          <MDAlertCloseIcon onClick={mount ? handleAlertStatus : null}>&times;</MDAlertCloseIcon>
        ) : null}
        {showActions && (
          <MDBox display="flex" justifyContent="flex-end" gap={1}>
            <MDButton variant="outlined" color="light" size="small" onClick={onCancel}>
              Cancelar
            </MDButton>
            <MDButton variant="contained" color="white" size="small" onClick={onConfirm}>
              Confirmar
            </MDButton>
          </MDBox>
        )}
      </MDAlertRoot>
    </Fade>
  );

  switch (true) {
    case alertStatus === "mount":
      return alertTemplate();
    case alertStatus === "fadeOut":
      setTimeout(() => setAlertStatus("unmount"), 400);
      return alertTemplate(false);
    default:
      alertTemplate();
      break;
  }

  return null;
}

MDAlert.defaultProps = {
  color: "info",
  dismissible: false,
  showActions: false,
};

MDAlert.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  dismissible: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onDismiss: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  showActions: PropTypes.bool,
};

export default MDAlert;
