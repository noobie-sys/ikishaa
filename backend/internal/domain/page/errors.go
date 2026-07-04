package page

import "errors"

var ErrForbidden = errors.New("page does not belong to authenticated user")
