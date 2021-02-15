export default { title: "organisms/BookPreview" };

import { makeStyles } from "@material-ui/core/styles";
import BookPreview from "./BookPreview";
import { book } from "samples";

const useStyles = makeStyles((theme) => ({
  margin: {
    "& > :not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

const handlers = {
  onEditClick: console.log,
};

export const Default = () => {
  const classes = useStyles();
  return (
    <div className={classes.margin}>
      {[...Array(10)].map((_value, index) => (
        <BookPreview key={index} {...handlers} book={book} />
      ))}
    </div>
  );
};

export const Checked = () => {
  const classes = useStyles();
  return (
    <div className={classes.margin}>
      {[...Array(10)].map((_value, index) => (
        <BookPreview
          key={index}
          checked={index === 1}
          {...handlers}
          book={book}
        />
      ))}
    </div>
  );
};

export const EmptySection = () => {
  return <BookPreview {...handlers} book={{ ...book, sections: [] }} />;
};

export const NoEditable = () => {
  return <BookPreview book={book} />;
};
