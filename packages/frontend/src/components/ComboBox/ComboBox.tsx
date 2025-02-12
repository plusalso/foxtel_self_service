import React, { useState, useEffect } from "react";
import { useCombobox } from "downshift";
import fuzzysort from "fuzzysort";
import styles from "./ComboBox.module.scss";
import clsx from "clsx";

interface Asset {
  id: string;
  name: string;
  imageUrl: string;
}

interface ComboboxProps {
  assets: Asset[];
  value: string | null;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onValueChange: (value: string) => void;
}

const Combobox: React.FC<ComboboxProps> = ({ assets, value, inputValue, onInputValueChange, onValueChange }) => {
  const [inputItems, setInputItems] = useState(assets);

  useEffect(() => {
    if (inputValue) {
      const results = fuzzysort.go(inputValue, assets, { key: "name" });
      setInputItems(results.map((result) => result.obj));
    } else {
      setInputItems(assets);
    }
  }, [assets, inputValue]);

  const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps, reset } =
    useCombobox({
      items: inputItems,
      itemToString: (item) => (item ? item.name : ""),
      inputValue,
      selectedItem: assets.find((item) => item.id === value) || null,
      onInputValueChange: ({ inputValue }) => {
        onInputValueChange(inputValue || "");
      },
      onSelectedItemChange: ({ selectedItem }) => {
        if (selectedItem) {
          onValueChange(selectedItem.id);
        }
      },
    });

  return (
    <div className={styles.comboboxContainer}>
      {/* <label {...getLabelProps()}>Select Asset:</label> */}
      <div className={styles.comboboxInputContainer}>
        <input {...getInputProps()} className={styles.comboboxInput} placeholder="Search assets..." />
        <button
          type="button"
          onClick={() => {
            reset();
            onInputValueChange("");
            onValueChange("");
          }}
          className={styles.comboboxClearButton}
          aria-label="clear selection"
        >
          &#x2715;
        </button>
        <button type="button" {...getToggleButtonProps()} className={styles.comboboxButton} aria-label="toggle menu">
          &#8595;
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className={clsx(styles.comboboxList, {
          [styles.comboboxListOpen]: isOpen,
        })}
      >
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              className={`${styles.comboboxItem} ${highlightedIndex === index ? styles.comboboxItemHighlighted : ""}`}
            >
              <img src={item.imageUrl} alt={item.name} className={styles.comboboxItemImage} />
              {item.name}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Combobox;
