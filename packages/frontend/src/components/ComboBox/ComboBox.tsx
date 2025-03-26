import React, { useState, useEffect, useRef } from "react";
import { useCombobox } from "downshift";
import fuzzysort from "fuzzysort";
import styles from "./ComboBox.module.scss";
import clsx from "clsx";
import { LuCircleX } from "react-icons/lu";
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
  const [isFiltering, setIsFiltering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFiltering && inputValue) {
      const results = fuzzysort.go(inputValue, assets, { key: "name" });
      setInputItems(results.map((result) => result.obj));
    } else {
      setInputItems(assets);
    }
  }, [assets, inputValue, isFiltering]);

  const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps, reset } =
    useCombobox({
      items: inputItems,
      itemToString: (item) => (item ? item.name : ""),
      inputValue,
      selectedItem: assets.find((item) => item.id === value) || null,
      defaultHighlightedIndex: -1,
      defaultIsOpen: false,
      initialIsOpen: false,
      onStateChange: ({ type, selectedItem: newSelectedItem, inputValue: newInputValue }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputChange:
            setIsFiltering(true);
            onInputValueChange(newInputValue || "");
            break;
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            if (newSelectedItem) {
              setIsFiltering(false);
              onValueChange(newSelectedItem.id);
              onInputValueChange(newSelectedItem.name);
            }
            break;
          case useCombobox.stateChangeTypes.ToggleButtonClick:
          case useCombobox.stateChangeTypes.InputClick:
            if (!isOpen) {
              setIsFiltering(false);
              // Keep the selected item's name in the input
              const selectedItem = assets.find((item) => item.id === value);
              onInputValueChange(selectedItem?.name || "");
            }
            break;
        }
      },
    });

  const inputProps = getInputProps({
    ref: inputRef,
  });

  return (
    <div className={styles.comboboxContainer}>
      {/* <label {...getLabelProps()}>Select Asset:</label> */}
      <div className={styles.comboboxInputContainer}>
        <input {...inputProps} className={styles.comboboxInput} placeholder="Search assets..." />
        <button
          type="button"
          onClick={() => {
            reset();
            onInputValueChange("");
            inputRef.current?.focus();
          }}
          className={styles.comboboxClearButton}
          aria-label="clear selection"
        >
          <div className={styles.comboboxClearButtonIcon}>
            <LuCircleX size={15} />
          </div>
        </button>
        <button type="button" {...getToggleButtonProps()} className={styles.comboboxButton} aria-label="toggle menu">
          <div className={styles.comboboxButtonIcon}>
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="black"
              xmlns="http://www.w3.org/2000/svg"
              className="rt-SelectIcon"
              aria-hidden="true"
            >
              <path d="M0.135232 3.15803C0.324102 2.95657 0.640521 2.94637 0.841971 3.13523L4.5 6.56464L8.158 3.13523C8.3595 2.94637 8.6759 2.95657 8.8648 3.15803C9.0536 3.35949 9.0434 3.67591 8.842 3.86477L4.84197 7.6148C4.64964 7.7951 4.35036 7.7951 4.15803 7.6148L0.158031 3.86477C-0.0434285 3.67591 -0.0536285 3.35949 0.135232 3.15803Z"></path>
            </svg>
          </div>
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className={clsx(styles.comboboxList, {
          [styles.comboboxListOpen]: isOpen,
        })}
      >
        {isOpen && (
          <>
            {inputItems.length > 0 ? (
              inputItems.map((item, index) => (
                <li
                  key={item.id}
                  {...getItemProps({ item, index })}
                  className={`${styles.comboboxItem} ${
                    highlightedIndex === index ? styles.comboboxItemHighlighted : ""
                  }`}
                >
                  <img src={item.imageUrl} alt={item.name} className={styles.comboboxItemImage} />
                  {item.name}
                </li>
              ))
            ) : (
              <li className={styles.comboboxNoResults}>No results found</li>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default Combobox;
